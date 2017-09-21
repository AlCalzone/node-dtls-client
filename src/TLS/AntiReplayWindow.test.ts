import { expect } from "chai";
import { AntiReplayWindow } from "./AntiReplayWindow";
// tslint:disable:no-unused-expression

describe("AntiReplayWindow =>", () => {
	it("constructor & reset", () => {
		const wnd = new AntiReplayWindow() as any;
		expect(wnd.window).to.deep.equal([0, 0]);
		expect(wnd.ceiling).to.be.equal(63);
		// put bullshit data in
		wnd.window = [1, 2, 3];
		wnd.ceiling = -1;
		// reset
		wnd.reset();
		expect(wnd.window).to.deep.equal([0, 0]);
		expect(wnd.ceiling).to.be.equal(63);
	});

	it("usage 1", () => {
		const wnd = new AntiReplayWindow();
		// test some seq_numbers against the default window (0..63)
		expect(wnd.hasReceived(-1)).to.be.false;
		expect(wnd.mayReceive(-1)).to.be.false;
		expect(wnd.hasReceived(0)).to.be.false;
		expect(wnd.mayReceive(0)).to.be.true;
		expect(wnd.hasReceived(63)).to.be.false;
		expect(wnd.mayReceive(63)).to.be.true;
		expect(wnd.hasReceived(64)).to.be.false;
		expect(wnd.mayReceive(64)).to.be.true;
		expect(wnd.hasReceived(127)).to.be.false;
		expect(wnd.mayReceive(127)).to.be.true;
		// above ceiling+width we should discard the packets
		expect(wnd.hasReceived(128)).to.be.false;
		expect(wnd.mayReceive(128)).to.be.false;

		// receive a packet
		expect(wnd.hasReceived(5)).to.be.false;
		wnd.markAsReceived(5);
		expect(wnd.hasReceived(5)).to.be.true;
		// the window should still be the same
		// tslint:disable-next-line:no-string-literal
		expect(wnd["window"]).to.deep.equal([1 << 5, 0]);
		// tslint:disable-next-line:no-string-literal
		expect(wnd["ceiling"]).to.be.equal(63);

		// now receive one outside the window
		wnd.markAsReceived(65);
		expect(wnd.hasReceived(5)).to.be.true;
		expect(wnd.hasReceived(65)).to.be.true;
		expect(wnd.mayReceive(1)).to.be.false;
		expect(wnd.mayReceive(5)).to.be.false;
		expect(wnd.mayReceive(65)).to.be.false;

		// now make a larger step
		wnd.markAsReceived(100);
		// 5 should already be outside the window
		expect(wnd.hasReceived(5)).to.be.false;
		expect(wnd.hasReceived(65)).to.be.true;
		expect(wnd.hasReceived(100)).to.be.true;
	});
});
